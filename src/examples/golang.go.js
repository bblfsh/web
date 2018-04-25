export const go_example_1 = `package main

import "fmt"

//SyncFunc prints three lines of text
func SyncFunc(from string) {
    for i := 0; i < 3; i++ {
        fmt.Println(from, ":", i)
    }
}

func main() {
    // syncronous function
    SyncFunc("direct")

    // goroutine call
    go SyncFunc("goroutine")

    // anonymous goroutine call
    go func(msg string) {
        fmt.Println(msg)
    }("going")

    // not blocked call
    fmt.Scanln()
    fmt.Println("done")
}

`;
