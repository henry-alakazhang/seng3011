from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^profile$', views.profile, name="profile_home"),
    url(r'^instructions$', views.save_instructions, name="save_instructions"),
    url(r'^news$', views.news_view, name="save_news")
]
