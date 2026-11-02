from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.routers import DefaultRouter

from campeonatos.views import (
    CampeonatoViewSet,
    JogadorViewSet,
    PartidaViewSet,
    TimeViewSet,
)

router = DefaultRouter()
router.register("campeonatos", CampeonatoViewSet, basename="campeonato")
router.register("times", TimeViewSet, basename="time")
router.register("jogadores", JogadorViewSet, basename="jogador")
router.register("partidas", PartidaViewSet, basename="partida")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
