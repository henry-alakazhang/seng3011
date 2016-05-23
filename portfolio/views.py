from django.shortcuts import render

from django.http import HttpResponse, JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.forms import model_to_dict
try: import simplejson as json
except ImportError: import json
from eventstudyapi.models import UserPortfolio, UserProfileExtras, UserSavedNews

# Create your views here.
def profile(request):
    if request.user.is_authenticated():
        notice = ""
        user = request.user
        if (request.GET.get('addric')):
            if (list(UserPortfolio.objects.filter(user=user, portfolio=request.GET.get('addric').upper()))):
                notice = "You've already added this RIC!"
            else:
                newPortfolio = UserPortfolio.objects.create(user=user)
                newPortfolio.portfolio = request.GET.get('addric').upper()
                newPortfolio.save()
        if (request.GET.get('removeric')):
            toDelete = list(UserPortfolio.objects.filter(user=user, portfolio=request.GET.get('removeric').upper()))
            for p in toDelete:
                p.delete()
        if (request.GET.get('removeall')):
            toDelete = list(UserPortfolio.objects.filter(user=user))
            for p in toDelete:
                p.delete()
        portfolio = list(UserPortfolio.objects.filter(user=user).values('portfolio'))
        try:
            profile = UserProfileExtras.objects.get(user=user)
            print(profile.file_key)
        except ObjectDoesNotExist: 
            profile = None
        savedNews = get_news(request)['news']
        return render(request, 'portfolio/profile.html', {'user ': user, 'portfolio' : portfolio, 
                                                          'notice' : notice, 'profile':profile, 'news' : savedNews})
    else:
        return render(request, 'portfolio/profile.html')

def save_instructions(request):
    return JsonResponse({"status" : "UNIMPLEMENTED"})

# saving news related views
@csrf_exempt
def news_view(request):
    if not request.user.is_authenticated():
        return JsonResponse({"status" : "NOAUTH"})
    if request.POST:
        return JsonResponse(save_news(request))
    else:
        return JsonResponse(get_news(request))

def save_news(request):
    if request.POST.get('update') == 'delete':
        toDelete = list(UserSavedNews.objects.filter(user=request.user,title=request.POST.get('title')))
        for n in toDelete:
            n.delete()
    else: # if request.POST.get('update') == 'add'
        article = UserSavedNews.objects.create(user=request.user)
        article.title = request.POST.get('title')
        article.body = request.POST.get('body')
        article.timestamp = request.POST.get('date')
        article.sentiment = request.POST.get('sentiment')
        article.tags = request.POST.get('tags')
        article.save()
    return {"status" : "OK"}

def get_news(request):
    saved = list(UserSavedNews.objects.filter(user=request.user))
    resp = dict()
    resp['news'] = list()
    for news in saved:
        resp['news'].append(model_to_dict(news))
    return resp