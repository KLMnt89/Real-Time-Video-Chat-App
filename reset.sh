#!/bin/bash
# Wipes the database volume and starts fresh. All data will be lost.
docker compose down -v
docker compose up --build
