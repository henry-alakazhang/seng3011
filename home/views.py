from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def index(request):
    return render(request, 'home/home.html', {'home':True});

def about(request):
    return render(request, 'home/about.html', {'about':True});

def api_home(request):
    return render(request, 'home/api.html', {'api':True});

def api_versions(request):
    return render(request, 'home/api_versions.html', {'api':True});

def api_docs(request):
    return render(request, 'home/api_docs.html', {'api':True});

def api_bugs(request):
    return render(request, 'home/api_bugs.html', {'api':True});

def analytics_home(request):
    return render(request, 'home/analytics.html', {'analytics':True});