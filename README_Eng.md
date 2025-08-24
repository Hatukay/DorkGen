# DorkGen – Web Application for Simplified Google Dork Queries

Today, cybersecurity and penetration testing involve not only vulnerability scanners but also analyzing target systems with precise queries. This is where DorkGen comes in: a modern web application that allows security testers to quickly and reliably create Google Dork queries.

## Purpose of the Project

The main goal of DorkGen is to simplify the creation of Google Dork queries, which can be complex and cumbersome when written manually. Users can select a target domain, add keywords, choose file types and vulnerability categories, and instantly generate functional dork queries. Additionally, the generated queries can be saved, managed, and executed directly on Google.

## Basic and Advanced Features

DorkGen provides a two-layered functionality:

### Basic Features
- **Target Domain**: Users can create queries for a specific domain.
- **Keywords**: Queries can be enhanced with custom keywords.
- **File Types**: Search specific files such as PDF, Office, archive, code, and database files.
- **Vulnerability Detection**: Easily scan for directory listing, exposed config, log files, and more.
- **CMS Detection**: Detect WordPress, Joomla, and Drupal.
- **Authentication**: Search login pages, admin panels, and user files.
- **Error Detection**: Query SQL errors, stack traces, and debug information.

### Advanced Features
- **Query Saving**: Save generated queries for later use.
- **Quick Access**: Load saved queries with a single click.
- **Google Integration**: Execute queries directly on Google.
- **Responsive Design**: Interface adapts to both mobile and desktop devices.

## Technical Architecture

The project was developed using a Docker-based structure, ensuring dependencies and environments are isolated and development is smooth.

### Backend – Go
- **Framework**: Gin web framework for fast API development.
- **Database**: SQLite, integrated with CGO.
- **Docker**: Multi-stage build optimized for both development and production.
- **API**: Data flow handled via RESTful endpoints.

### Frontend – React
- **Framework**: React 18.
- **Styling**: Modern and fast UI using Tailwind CSS.
- **Icons**: Lucide React icon library.
- **HTTP Client**: Axios for backend communication.
- **Docker**: Multi-stage build with development and Nginx-based production.

### Docker Structure
- **Development**: Hot-reload and volume mounts for fast development.
- **Production**: Optimized images served through Nginx.
- **Networking**: Isolated container network ensures secure communication.

## Setup and Execution

Only Docker and Docker Compose are required to run the project.

### Development
```bash
git clone <repository-url>
cd dorkgen-docker
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```
- Frontend: http://localhost
- Backend API: http://localhost:8080

## Project Structure
```
dorkgen-docker/
├── docker-compose.yml
├── docker-compose.override.yml
├── docker-compose.prod.yml
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   └── src/
└── README.md
```

## API Endpoints
- `POST /api/generate` → Generate a new dork query
- `GET /api/dorks` → List saved dork queries
- `POST /api/dorks` → Save a new dork query
- `DELETE /api/dorks/:id` → Delete a saved dork query
- `GET /api/categories` → Retrieve category list

## Usage Examples

### Simple Domain Search
```
Domain: example.com
Keywords: admin, config
```
**Generated Query:**
```
site:example.com admin config
```

### Advanced Vulnerability Search
```
Domain: example.com
File Types: pdf, doc
Vulnerability: directory_listing, exposed_config
CMS: wordpress
```
**Generated Query:**
```
site:example.com filetype:pdf OR filetype:doc OR filetype:docx intitle:"index of" intext:"config" OR intext:"configuration" intext:"powered by wordpress" OR intext:"wp-content"
```

## Conclusion

DorkGen provides security researchers and penetration testers with an efficient, organized way to generate, manage, and execute Google Dork queries. With modern web technologies and a Docker-based development and deployment setup, the application runs smoothly in both development and production environments. Now, creating, saving, and executing dork queries is easier than ever from a single interface.

