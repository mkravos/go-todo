package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/joho/godotenv"

	"github.com/gofiber/fiber/v2"
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
		log.Fatal("Error loading .env file")
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

	// initialize app
	app := fiber.New()

	// health check
	app.Get("/healthcheck", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// adds a new todo item and returns the new list of todo items
	app.Post("/api/add-todo-item", func(c *fiber.Ctx) error {
		// instantiate a new TodoItem object
		todo_item := &TodoItem{}

		// destructure payload into struct
		payload := struct {
			Text string `json:"text"`
			Due  string `json:"due"`
		}{}

		// parse request body into payload or return error
		if err := c.BodyParser(&payload); err != nil {
			c.Status(http.StatusUnprocessableEntity).JSON(&fiber.Map{"message": "request failed"})
			return err
		}

		// check todo_item for errors
		if err := c.BodyParser(todo_item); err != nil {
			c.Status(http.StatusUnprocessableEntity).JSON(&fiber.Map{"message": "request failed"})
			return err
		}

		// add text to item
		todo_item.Text = payload.Text
		// add datetime of creation to item
		todo_item.Created = time.Now().String()

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

	// gets all todo items
	app.Get("/api/get-todo-items", func(c *fiber.Ctx) error {
		// return list of todo items
		todo_items := []TodoItem{}
		db.Find(&todo_items)
		return c.JSON(&todo_items)
	})

	// listen on port specified in .env file
	log.Fatal(app.Listen(os.Getenv("SERVER_PORT")))
}
