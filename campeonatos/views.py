from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Campeonato, Jogador, Partida, Time
from .serializers import (
    CampeonatoSerializer,
    JogadorSerializer,
    PartidaSerializer,
    PlacarSerializer,
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

    @extend_schema(request=PlacarSerializer, responses=PartidaSerializer)
    @action(detail=True, methods=["post"], url_path="registrar-placar")
    def registrar_placar(self, request, pk=None):
        partida = self.get_object()
        if partida.status == Partida.Status.FINALIZADA:
            return Response({"detail": "A partida já foi finalizada."}, status=status.HTTP_409_CONFLICT)
        placar = PlacarSerializer(data=request.data)
        placar.is_valid(raise_exception=True)
        partida.gols_mandante = placar.validated_data["gols_mandante"]
        partida.gols_visitante = placar.validated_data["gols_visitante"]
        partida.status = Partida.Status.FINALIZADA
        partida.save()
        return Response(PartidaSerializer(partida).data)
