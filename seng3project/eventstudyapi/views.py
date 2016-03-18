from django.http import HttpResponse
from django.shortcuts import render


def index(request):
    return HttpResponse("Hello world, you are at the Event Study API index.")
