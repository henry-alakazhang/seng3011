from django.shortcuts import render

from django.http import HttpResponse, JsonResponse
try: import simplejson as json
except ImportError: import json
from eventstudyapi.models import UserPortfolio

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
        return render(request, 'portfolio/profile.html', {'user ': user, 'portfolio' : portfolio, 'notice' : notice})
    else:
        return render(request, 'portfolio/profile.html')