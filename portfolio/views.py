from django.shortcuts import render

from django.http import HttpResponse, JsonResponse

# Create your views here.
def profile(request):
    if request.user.is_authenticated():
        user=request.user
        return render(request, 'portfolio/profile.html', {'user ': user})
    else:
        return render(request, 'portfolio/profile.html')