install-go:
	cd ./server && go install

run: install-go
	cd server && go run main.go