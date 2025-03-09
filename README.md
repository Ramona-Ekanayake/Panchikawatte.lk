# Panchikawatte.lk

A modern web platform connecting vehicle owners with part suppliers in Sri Lanka.

## Features

- User registration and authentication with phone verification
- Post vehicle part requests
- Browse part requests
- Contact part requesters (for registered users)
- Modern, responsive UI with Sri Lankan design elements

## Prerequisites

- Go 1.21 or higher
- SMS service provider account (for phone verification)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/panchikawatte.lk.git
cd panchikawatte.lk
```

2. Install dependencies:
```bash
go mod tidy
```

3. Create a `.env` file in the root directory:
```env
PORT=8080
JWT_SECRET=your-secret-key
SMS_API_KEY=your-sms-api-key
```

4. Run the server:
```bash
go run cmd/server/main.go
```

5. Open your browser and visit `http://localhost:8080`

## Project Structure

```
panchikawatte.lk/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   │   └── handlers.go
│   ├── models/
│   │   └── models.go
│   └── database/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
├── templates/
│   └── index.html
├── go.mod
├── go.sum
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 