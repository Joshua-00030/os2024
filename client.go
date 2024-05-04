package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math/rand/v2"
	"net/http"
)

const url = "http://158.101.29.37:3001"

type table struct {
	Results []tableItem `json:"table"`
}

type tableItem struct {
	MathType string `json:"type"`
	Count    int    `json:"count"`
}

func addRequest(url string) {
	num1 := rand.Float32() * 1000000
	num2 := rand.Float32() * 1000000
	var js = []byte(fmt.Sprintf(`{"number1":"%v","number2":"%v"}`, num1, num2))

	r, err := http.Post(fmt.Sprintf(`%s/magicAdd`, url), "application/json", bytes.NewBuffer(js))

	if err != nil {
		panic(err)
	}

	defer r.Body.Close()

	body, _ := io.ReadAll(r.Body)
	fmt.Println("response Body:", string(body))
}

func minRequest(url string) {
	num1 := rand.Float32() * 1000000
	num2 := rand.Float32() * 1000000
	var js = []byte(fmt.Sprintf(`{"number1":"%v","number2":"%v"}`, num1, num2))

	r, err := http.Post(fmt.Sprintf(`%s/magicfindmin`, url), "application/json", bytes.NewBuffer(js))

	if err != nil {
		panic(err)
	}

	defer r.Body.Close()

	body, _ := io.ReadAll(r.Body)
	fmt.Println("response Body:", string(body))
}

func subRequest(url string) {
	num1 := rand.Float32() * 1000000
	num2 := rand.Float32() * 1000000
	var js = []byte(fmt.Sprintf(`{"number1":"%v","number2":"%v"}`, num1, num2))

	r, err := http.Post(fmt.Sprintf(`%s/magicsubtract`, url), "application/json", bytes.NewBuffer(js))

	if err != nil {
		panic(err)
	}

	defer r.Body.Close()

	body, _ := io.ReadAll(r.Body)
	fmt.Println("response Body:", string(body))
}

func maxRequest(url string) {
	num1 := rand.Float32() * 1000000
	num2 := rand.Float32() * 1000000
	var js = []byte(fmt.Sprintf(`{"number1":"%v","number2":"%v"}`, num1, num2))

	r, err := http.Post(fmt.Sprintf(`%s/magicfindmax`, url), "application/json", bytes.NewBuffer(js))

	if err != nil {
		panic(err)
	}

	defer r.Body.Close()

	body, _ := io.ReadAll(r.Body)
	fmt.Println("response Body:", string(body))
}

func main() {
	fmt.Println("URL: ", url)

	for i := 0; i < 1000; i++ {
		messageType := rand.IntN(4)
		switch messageType {
		case 0:
			addRequest(url)
		case 1:
			subRequest(url)
		case 2:
			maxRequest(url)
		case 3:
			minRequest(url)
		}
	}

	r, err := http.Get(fmt.Sprintf(`%s/viewTable`, url))

	if err != nil {
		panic(err)
	}

	defer r.Body.Close()

	body, _ := io.ReadAll(r.Body)

	var t table
	err = json.Unmarshal(body, &t)

	if err != nil {
		panic(err)
	}

	fmt.Println("Total Operations Performed:")
	for _, tableItem := range t.Results {
		fmt.Printf("%s: %v\n", tableItem.MathType, tableItem.Count)
	}

	fmt.Println("\nPress enter to continue...")
	fmt.Scanln()
}
