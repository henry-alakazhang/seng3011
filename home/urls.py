from django.conf.urls import url

from . import views

urlpatterns = [
    # url(r'^$', views.index, name='index'),
    url(r'^$', views.index, name="home_index"),
    url(r'^about$', views.about, name="about_us"),
    url(r'^api$', views.api_home, name="api_home"),
    url(r'^api/releases$', views.api_versions, name="api_versions"),
    url(r'^api/docs$', views.api_docs, name="api_docs"),
    url(r'^api/bugs$', views.api_bugs, name="api_bugs"),
    url(r'^analytics$', views.analytics_home, name="analytics_home")
]