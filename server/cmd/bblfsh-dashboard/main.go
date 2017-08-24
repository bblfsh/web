package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/bblfsh/dashboard/server"
	"github.com/bblfsh/dashboard/server/asset"
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
)

const VERSION = "v0.1.0"

func flags() (addr, bblfshAddr string, debug, version bool) {
	flag.StringVar(&addr, "addr", ":9999", "address in which the server will run")
	flag.StringVar(&bblfshAddr, "bblfsh-addr", "0.0.0.0:9432", "address of the babelfish server")
	flag.BoolVar(&debug, "debug", false, "run in debug mode")
	flag.BoolVar(&version, "version", false, "show version and exits")
	flag.Parse()

	return
}

func main() {
	addr, bblfshAddr, debug, version := flags()

	if version {
		fmt.Printf("bblfsh-dashboard %s\n", VERSION)
		return
	}

	if !debug {
		gin.SetMode(gin.ReleaseMode)
	}

	s, err := server.New(bblfshAddr)
	if err != nil {
		logrus.Fatalf("error starting new server at %s: %s", addr, err)
	}

	w := logrus.StandardLogger().Writer()
	defer w.Close()

	log.SetOutput(w)

	r := gin.New()
	r.Use(gin.RecoveryWithWriter(w))
	r.Use(gin.LoggerWithWriter(w))

	dir, err := mountAssets()
	if err != nil {
		logrus.Fatalf("unable to mount assets: %s", err)
	}

	assets, err := asset.AssetDir("build")
	if err != nil {
		logrus.Fatalf("cannot list assets: %s", err)
	}

	for _, a := range assets {
		if a != "static" {
			r.StaticFile("/"+a, filepath.Join(dir, a))
		}
	}
	r.StaticFile("/", filepath.Join(dir, "index.html"))
	r.Static("/static", filepath.Join(dir, "static"))

	api := r.Group("/api")
	api.POST("/parse", s.HandleParse)
	api.GET("/drivers", s.ListDrivers)

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

func mountAssets() (string, error) {
	dir, err := ioutil.TempDir(os.TempDir(), "bblfsh-dashboard-assets")
	if err != nil {
		return "", err
	}

	if err := asset.RestoreAssets(dir, "build"); err != nil {
		return "", err
	}

	return filepath.Join(dir, "build"), nil
}

func withCORS(handler http.Handler) http.Handler {
	cors := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	return cors.Handler(handler)
}
