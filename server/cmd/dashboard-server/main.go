package main

import (
	"flag"
	"log"
	"net/http"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/bblfsh/dashboard/server"
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
)

func flags() (addr, bblfshAddr string) {
	flag.StringVar(&addr, "addr", ":9999", "address in which the server will run")
	flag.StringVar(&bblfshAddr, "bblfsh-addr", "0.0.0.0:9432", "address of the babelfish server")
	flag.Parse()

	return addr, bblfshAddr
}

func main() {
	addr, bblfshAddr := flags()

	s, err := server.New(bblfshAddr)
	if err != nil {
		logrus.Fatalf("error starting new server at %s: %s", addr, err)
	}

	r := gin.Default()
	r.POST("/parse", s.HandleParse)

	logrus.Info("starting REST server")
	w := logrus.StandardLogger().Writer()
	defer w.Close()

	server := &http.Server{
		Addr:         addr,
		Handler:      withCORS(r),
		ReadTimeout:  1 * time.Minute,
		WriteTimeout: 5 * time.Minute,
		ErrorLog:     log.New(w, "", 0),
	}

	if err := server.ListenAndServe(); err != nil {
		logrus.Fatal(err)
	}
}

func withCORS(handler http.Handler) http.Handler {
	cors := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	return cors.Handler(handler)
}
