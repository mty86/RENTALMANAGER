@echo off
title Rental Manager - Sistema de Alquiler de Mobiliario y Logistica
color 0A
echo =======================================================================
echo          RENTAL MANAGER - SISTEMA DE ALQUILER DE MOBILIARIO
echo =======================================================================
echo.
echo Iniciando Servidor Express (Puerto 3001) y Cliente Web (Puerto 5173)...
echo.
call npm.cmd run dev
pause
