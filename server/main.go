package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/joho/godotenv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type TodoItem struct {
	ID      int    `json:"id" sql:"AUTO_INCREMENT" gorm:"primary_key"`
	Text    string `json:"text"`
	Created string `json:"created"`
}

// Connects to Postgres database.
func ConnectDB() (*gorm.DB, error) {
	// attempt to load .env file
	err := godotenv.Load()
	if err != nil {
		log.Print("Could not load .env file. Assuming docker environment.")
	}

	// get db connection info from .env file
	var (
		Host     = os.Getenv("POSTGRES_HOST")
		Port     = os.Getenv("POSTGRES_PORT")
		User     = os.Getenv("POSTGRES_USER")
		Password = os.Getenv("POSTGRES_PASSWORD")
		DBName   = os.Getenv("POSTGRES_DB")
		SSLMode  = os.Getenv("POSTGRES_SSLMODE")
	)

	// attempt to connect
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		Host, Port, User, Password, DBName, SSLMode,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return db, err
	}

	// return database instance
	return db, nil
}

// Runs database migration.
func MigrateDB(db *gorm.DB) error {
	err := db.AutoMigrate(&TodoItem{})
	return err
}

// Runs the server and contains API routes.
func main() {
	fmt.Print("Attempting to run server")

	// attempt DB connection
	db, dberr := ConnectDB()
	if dberr != nil {
		log.Fatal("Could not load the database")
	}

	// attempt DB migration
	dberr = MigrateDB(db)
	if dberr != nil {
		log.Fatal("Could not migrate the database")
	}

	corsSettings := cors.New(cors.Config{
		AllowOrigins: os.Getenv("CLIENT_URL"),
		AllowMethods: "GET,POST,DELETE",
	})

	// initialize app
	app := fiber.New()
	app.Use(corsSettings)

	// health check
	app.Get("/healthcheck", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// adds a new todo item and returns the new list of todo items
	app.Post("/api/add-todo-item", func(c *fiber.Ctx) error {
		// instantiate a new TodoItem object
		todo_item := &TodoItem{}

		// check todo_item for errors
		if err := c.BodyParser(todo_item); err != nil {
			c.Status(http.StatusUnprocessableEntity).JSON(&fiber.Map{"message": "request failed"})
			return err
		}

		// destructure payload into struct
		payload := struct {
			Text    string `json:"text"`
			Created string `json:"created"`
		}{}

		// parse request body into payload or return error
		if err := c.BodyParser(&payload); err != nil {
			c.Status(http.StatusUnprocessableEntity).JSON(&fiber.Map{"message": "request failed"})
			return err
		}

		// add text to item
		todo_item.Text = payload.Text
		// add datetime of creation to item
		todo_item.Created = payload.Created

		// add db entry
		err := db.Create(&todo_item).Error
		if err != nil {
			c.Status(http.StatusBadRequest).JSON(&fiber.Map{"message": "could not create item"})
			return err
		}

		c.Status(http.StatusOK).JSON(&fiber.Map{"message": "item has been added"})

		// return new list of todo items
		todo_items := []TodoItem{}
		db.Find(&todo_items)
		return c.JSON(&todo_items)
	})

	// Gets all todo items.
	app.Get("/api/get-todo-items", func(c *fiber.Ctx) error {
		todo_items := []TodoItem{}
		db.Find(&todo_items)
		return c.JSON(&todo_items)
	})

	// Edits todo item by ID.
	app.Post("/api/edit-todo-item", func(c *fiber.Ctx) error {
		// instantiate a new TodoItem object
		todo_item := &TodoItem{}

		// check todo_item for errors
		if err := c.BodyParser(todo_item); err != nil {
			c.Status(http.StatusUnprocessableEntity).JSON(&fiber.Map{"message": "request failed"})
			return err
		}

		// destructure payload into struct
		payload := struct {
			ID   int    `json:"id"`
			Text string `json:"text"`
		}{}

		// parse request body into payload or return error
		if err := c.BodyParser(&payload); err != nil {
			c.Status(http.StatusUnprocessableEntity).JSON(&fiber.Map{"message": "request failed"})
			return err
		}

		// add new text to item
		todo_item.Text = payload.Text

		// edit db entry
		db.Model(&TodoItem{}).Where("id = ?", payload.ID).Update("text", payload.Text)

		// return new list of todo items
		todo_items := []TodoItem{}
		db.Find(&todo_items)
		return c.JSON(&todo_items)
	})

	// Deletes todo item by ID.
	app.Delete("/api/delete-todo-item", func(c *fiber.Ctx) error {
		// destructure payload into struct
		payload := struct {
			ID int `json:"id"`
		}{}

		// parse request body into payload or return error
		if err := c.BodyParser(&payload); err != nil {
			c.Status(http.StatusUnprocessableEntity).JSON(&fiber.Map{"message": "request failed"})
			return err
		}

		// delete db entry
		db.Delete(&TodoItem{}, payload.ID)

		// return new list of todo items
		todo_items := []TodoItem{}
		db.Find(&todo_items)
		return c.JSON(&todo_items)
	})

	// listen on port 8081
	log.Fatal(app.Listen(":8081"))
}
