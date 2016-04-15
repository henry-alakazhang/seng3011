from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def index(request):
    return HttpResponse("Welcome to the Team Cool home page!");

def about(request):
    return HttpResponse("We are Team Cool!");

def api_home(request):
    return HttpResponse("This is our event study API!");

def analytics_home(request):
    return HttpResponse("This is our Analytics Platform!");