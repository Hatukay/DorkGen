package main

import (
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type DorkRequest struct {
	Domain        string   `json:"domain"`
	Keywords      []string `json:"keywords"`
	FileTypes     []string `json:"fileTypes"`
	Vulnerability []string `json:"vulnerability"`
	CMS           []string `json:"cms"`
	Auth          []string `json:"auth"`
	Errors        []string `json:"errors"`
}

type DorkResponse struct {
	Query string `json:"query"`
	URL   string `json:"url"`
}

type SavedDork struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Query       string `json:"query"`
	Description string `json:"description"`
}

var (
	dorks []SavedDork
	nextID = 1
	mutex  sync.RWMutex
)

func main() {
	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	r := gin.Default()

	// CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://frontend:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api")
	{
		api.POST("/generate", generateDork)
		api.GET("/dorks", getSavedDorks)
		api.POST("/dorks", saveDork)
		api.DELETE("/dorks/:id", deleteDork)
		api.GET("/categories", getCategories)
	}

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}

// In-memory storage functions
func addDork(dork SavedDork) SavedDork {
	mutex.Lock()
	defer mutex.Unlock()
	
	dork.ID = nextID
	nextID++
	dorks = append(dorks, dork)
	return dork
}

func getAllDorks() []SavedDork {
	mutex.RLock()
	defer mutex.RUnlock()
	
	result := make([]SavedDork, len(dorks))
	copy(result, dorks)
	return result
}

func deleteDorkByID(id int) bool {
	mutex.Lock()
	defer mutex.Unlock()
	
	for i, dork := range dorks {
		if dork.ID == id {
			dorks = append(dorks[:i], dorks[i+1:]...)
			return true
		}
	}
	return false
}

func generateDork(c *gin.Context) {
	var req DorkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Build Google Dork query
	query := buildDorkQuery(req)
	url := "https://www.google.com/search?q=" + query

	response := DorkResponse{
		Query: query,
		URL:   url,
	}

	c.JSON(200, response)
}

func buildDorkQuery(req DorkRequest) string {
	query := "site:" + req.Domain

	// Add keywords
	if len(req.Keywords) > 0 {
		for _, keyword := range req.Keywords {
			query += " " + keyword
		}
	}

	// Add file types
	if len(req.FileTypes) > 0 {
		for _, fileType := range req.FileTypes {
			switch fileType {
			case "pdf":
				query += " filetype:pdf"
			case "doc":
				query += " filetype:doc OR filetype:docx"
			case "xls":
				query += " filetype:xls OR filetype:xlsx"
			case "zip":
				query += " filetype:zip OR filetype:rar OR filetype:tar.gz"
			case "sql":
				query += " filetype:sql"
			case "php":
				query += " filetype:php"
			case "asp":
				query += " filetype:asp OR filetype:aspx"
			}
		}
	}

	// Add vulnerability patterns
	if len(req.Vulnerability) > 0 {
		for _, vuln := range req.Vulnerability {
			switch vuln {
			case "directory_listing":
				query += " intitle:\"index of\""
			case "exposed_config":
				query += " intext:\"config\" OR intext:\"configuration\""
			case "database_exposure":
				query += " intext:\"mysql\" OR intext:\"database\""
			case "log_files":
				query += " filetype:log OR intext:\"error log\""
			case "backup_files":
				query += " filetype:bak OR filetype:backup OR intext:\"backup\""
			}
		}
	}

	// Add CMS detection
	if len(req.CMS) > 0 {
		for _, cms := range req.CMS {
			switch cms {
			case "wordpress":
				query += " intext:\"powered by wordpress\" OR intext:\"wp-content\""
			case "joomla":
				query += " intext:\"powered by joomla\" OR intext:\"joomla\""
			case "drupal":
				query += " intext:\"powered by drupal\" OR intext:\"drupal\""
			case "phpinfo":
				query += " intext:\"phpinfo()\" OR intext:\"php version\""
			}
		}
	}

	// Add authentication patterns
	if len(req.Auth) > 0 {
		for _, auth := range req.Auth {
			switch auth {
			case "login":
				query += " intext:\"login\" OR intext:\"sign in\""
			case "admin":
				query += " intext:\"admin\" OR intext:\"administrator\""
			case "password":
				query += " intext:\"password\" OR intext:\"passwd\""
			case "user_list":
				query += " intext:\"user\" OR intext:\"username\""
			}
		}
	}

	// Add error patterns
	if len(req.Errors) > 0 {
		for _, err := range req.Errors {
			switch err {
			case "sql_error":
				query += " intext:\"sql error\" OR intext:\"mysql error\""
			case "server_error":
				query += " intext:\"server error\" OR intext:\"500 error\""
			case "stack_trace":
				query += " intext:\"stack trace\" OR intext:\"exception\""
			case "debug_info":
				query += " intext:\"debug\" OR intext:\"development\""
			}
		}
	}

	return query
}

func getSavedDorks(c *gin.Context) {
	dorks := getAllDorks()
	c.JSON(200, dorks)
}

func saveDork(c *gin.Context) {
	var dork SavedDork
	if err := c.ShouldBindJSON(&dork); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	savedDork := addDork(dork)
	c.JSON(201, savedDork)
}

func deleteDork(c *gin.Context) {
	idStr := c.Param("id")
	
	// Convert string ID to int
	var id int
	_, err := fmt.Sscanf(idStr, "%d", &id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid ID format"})
		return
	}
	
	if deleteDorkByID(id) {
		c.JSON(200, gin.H{"message": "Dork deleted successfully"})
	} else {
		c.JSON(404, gin.H{"error": "Dork not found"})
	}
}

func getCategories(c *gin.Context) {
	categories := gin.H{
		"fileTypes": []string{"pdf", "doc", "xls", "zip", "sql", "php", "asp"},
		"vulnerability": []string{"directory_listing", "exposed_config", "database_exposure", "log_files", "backup_files"},
		"cms": []string{"wordpress", "joomla", "drupal", "phpinfo"},
		"auth": []string{"login", "admin", "password", "user_list"},
		"errors": []string{"sql_error", "server_error", "stack_trace", "debug_info"},
	}
	
	c.JSON(200, categories)
}
