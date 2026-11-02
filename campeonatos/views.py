from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .filters import PartidaFilter
from .models import Campeonato, Jogador, Partida, Time
from .serializers import (
    CampeonatoSerializer,
    ClassificacaoSerializer,
    JogadorSerializer,
    PartidaSerializer,
    PlacarSerializer,
    TimeSerializer,
)


class CampeonatoViewSet(ModelViewSet):
    queryset = Campeonato.objects.all().order_by("id")
    serializer_class = CampeonatoSerializer
    filterset_fields = ("status", "modalidade")
    search_fields = ("nome", "modalidade")
    ordering_fields = ("nome", "data_inicio", "data_fim", "max_times")

    @extend_schema(responses=ClassificacaoSerializer(many=True))
    @action(detail=True, methods=["get"])
    def classificacao(self, request, pk=None):
        """Tabela do campeonato: vitória 3 pts, empate 1 pt; considera só partidas finalizadas."""
        campeonato = self.get_object()
        tabela = {
            t.id: dict(time=t.id, nome=t.nome, jogos=0, vitorias=0, empates=0, derrotas=0,
                       gols_pro=0, gols_contra=0, saldo=0, pontos=0)
            for t in campeonato.times.all()
        }
        finalizadas = campeonato.partidas.filter(status=Partida.Status.FINALIZADA)
        for p in finalizadas:
            for time_id, pro, contra in (
                (p.mandante_id, p.gols_mandante, p.gols_visitante),
                (p.visitante_id, p.gols_visitante, p.gols_mandante),
            ):
                linha = tabela[time_id]
                linha["jogos"] += 1
                linha["gols_pro"] += pro
                linha["gols_contra"] += contra
                if pro > contra:
                    linha["vitorias"] += 1
                    linha["pontos"] += 3
                elif pro == contra:
                    linha["empates"] += 1
                    linha["pontos"] += 1
                else:
                    linha["derrotas"] += 1
        for linha in tabela.values():
            linha["saldo"] = linha["gols_pro"] - linha["gols_contra"]
        ordenada = sorted(tabela.values(), key=lambda l: (-l["pontos"], -l["saldo"], -l["gols_pro"], l["nome"]))
        for i, linha in enumerate(ordenada, start=1):
            linha["posicao"] = i
        return Response(ClassificacaoSerializer(ordenada, many=True).data)


class TimeViewSet(ModelViewSet):
    queryset = Time.objects.all().order_by("id")
    serializer_class = TimeSerializer
    filterset_fields = ("campeonato", "cidade", "ano_fundacao")
    search_fields = ("nome", "sigla", "cidade", "descricao")
    ordering_fields = ("nome", "sigla", "cidade", "ano_fundacao")


class JogadorViewSet(ModelViewSet):
    queryset = Jogador.objects.all().order_by("id")
    serializer_class = JogadorSerializer
    filterset_fields = ("time", "time__campeonato", "posicao")
    search_fields = ("nome", "posicao")
    ordering_fields = ("nome", "numero_camisa")


class PartidaViewSet(ModelViewSet):
    queryset = Partida.objects.all().order_by("id")
    serializer_class = PartidaSerializer
    filterset_class = PartidaFilter
    search_fields = ("mandante__nome", "visitante__nome")
    ordering_fields = ("data_hora", "status")

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
