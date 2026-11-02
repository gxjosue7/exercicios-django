from rest_framework.viewsets import ModelViewSet

from .models import Campeonato, Jogador, Partida, Time
from .serializers import (
    CampeonatoSerializer,
    JogadorSerializer,
    PartidaSerializer,
    TimeSerializer,
)


class CampeonatoViewSet(ModelViewSet):
    queryset = Campeonato.objects.all().order_by("id")
    serializer_class = CampeonatoSerializer


class TimeViewSet(ModelViewSet):
    queryset = Time.objects.all().order_by("id")
    serializer_class = TimeSerializer


class JogadorViewSet(ModelViewSet):
    queryset = Jogador.objects.all().order_by("id")
    serializer_class = JogadorSerializer


class PartidaViewSet(ModelViewSet):
    queryset = Partida.objects.all().order_by("id")
    serializer_class = PartidaSerializer
