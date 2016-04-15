from django.conf.urls import url

from . import views

urlpatterns = [
    # url(r'^$', views.index, name='index'),
    url(r'^$', views.index, name="Index page for 'home'"),
    url(r'^about$', views.about, name="About us page"),
    url(r'^api$', views.api_home, name="API instructions page"),
    url(r'^analytics$', views.analytics_home, name="Analytics home page")
]