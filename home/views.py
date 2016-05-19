from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
try: import simplejson as json
except ImportError: import json
from eventstudyapi.models import UserPortfolio, UserProfileExtras
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
    userData = None
    portfolio = []
    if request.user.is_authenticated():
        portfolio = list(UserPortfolio.objects.filter(user=request.user).values('portfolio'))
        try: 
            userData = UserProfileExtras.objects.get(user=request.user)
        except:
            userData = UserProfileExtras.objects.create(user=request.user)
            userData.file_key = 0
            userData.save()
    portJson = json.dumps(portfolio)
    return render(request, 'home/analytics.html', {'analytics':True,'portfolio':portJson, 'file_key': userData.file_key});

def analytics_howtouse(request):
    return render(request, 'home/analytics_howtouse.html', {'analytics':True});
