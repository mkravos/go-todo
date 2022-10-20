package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

type TodoItem struct {
	ID      int    `json:"id"`
	Text    string `json:"text"`
	Created string `json:"created"`
}

// Runs the server and contains API routes.
func main() {
	fmt.Print("Attempting to run server")

	app := fiber.New()

	// declare array for TodoItem objects
	todo_items := []TodoItem{}

	// health check
	app.Get("/healthcheck", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// gets all todo items
	app.Get("/api/get-todo-items", func(c *fiber.Ctx) error {
		return c.JSON(todo_items)
	})

	// adds a new todo item and returns the new list of todo items
	app.Post("/api/add-todo-item", func(c *fiber.Ctx) error {
		// instantiate a new TodoItem object
		todo_item := &TodoItem{}

		// get todo item text from request
		text := c.Params("text")

		// check todo_item for errors
		if err := c.BodyParser(todo_item); err != nil {
			return err
		}

		// generate todo_item ID
		todo_item.ID = len(todo_items) + 1
		// add text to item
		todo_item.Text = text
		// add datetime of creation to item
		todo_item.Created = time.Now().String()

		// append todo_item to todo_items
		todo_items = append(todo_items, *todo_item)

		// return new list of todo items
		return c.JSON(todo_items)
	})

	log.Fatal(app.Listen(":8081"))
}
