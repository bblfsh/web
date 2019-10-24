package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/bblfsh/web/server"
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
)

var version = "dev"

func flags() (addr, bblfshAddr string, debug, version bool) {
	flag.StringVar(&addr, "addr", ":9999", "address in which the server will run")
	flag.StringVar(&bblfshAddr, "bblfsh-addr", "0.0.0.0:9432", "address of the babelfish server")
	flag.BoolVar(&debug, "debug", false, "run in debug mode")
	flag.BoolVar(&version, "version", false, "show version and exits")
	flag.Parse()

	return
}

var logLevels = map[string]logrus.Level{
	"debug":   logrus.DebugLevel,
	"info":    logrus.InfoLevel,
	"warning": logrus.WarnLevel,
	"error":   logrus.ErrorLevel,
}

func main() {
	addr, bblfshAddr, debug, showVersion := flags()

	if showVersion {
		fmt.Printf("bblfsh-web %s\n", version)
		return
	}

	if level, ok := logLevels[os.Getenv("LOG_LEVEL")]; ok {
		logrus.SetLevel(level)
	}

	if !debug {
		gin.SetMode(gin.ReleaseMode)
	} else {
		logrus.SetLevel(logrus.TraceLevel)
	}

	s, err := server.New(bblfshAddr, version)
	if err != nil {
		logrus.Fatalf("error starting new server at %s: %s", addr, err)
	}

	w := logrus.StandardLogger().Writer()
	defer w.Close()

	log.SetOutput(w)

	r := gin.New()
	r.Use(gin.RecoveryWithWriter(w))
	r.Use(gin.LoggerWithWriter(w))

	server.Mount(s, r.Group("/api"))

	// TODO(@smacker): add configuration for ServerURL and FooterHTML
	static := server.NewStatic("/build", "", "")
	// use static http.Handler for unknown urls, because we do routing on frontend
	r.NoRoute(func(c *gin.Context) { static.ServeHTTP(c.Writer, c.Request) })

	logrus.WithField("addr", addr).Info("starting REST server")

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
