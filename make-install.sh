#!/bin/bash

palm-package redit
palm-install com.adrew.redit*.ipk
rm -f com.adrew.redit*.ipk
palm-launch com.adrew.redit
