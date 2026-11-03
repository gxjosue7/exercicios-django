from datetime import date

from django.db.models import Q
from rest_framework import serializers

from .models import Campeonato, Jogador, Partida, Time


def _valor(serializer, attrs, campo):
    if campo in attrs:
        return attrs[campo]
    return getattr(serializer.instance, campo, None)


class CampeonatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campeonato
        fields = "__all__"

    def validate_nome(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("O nome deve ter pelo menos 2 caracteres.")
        return value

    def validate_max_times(self, value):
        if value < 2:
            raise serializers.ValidationError("O campeonato precisa de pelo menos 2 times.")
        return value

    def validate(self, attrs):
        inicio = _valor(self, attrs, "data_inicio")
        fim = _valor(self, attrs, "data_fim")
        if inicio and fim and fim < inicio:
            raise serializers.ValidationError({"data_fim": "A data final não pode ser anterior à inicial."})
        return attrs


class TimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Time
        fields = "__all__"

    def validate_nome(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("O nome deve ter pelo menos 2 caracteres.")
        return value

    def validate_cidade(self, value):
        value = value.strip()
        if not 2 <= len(value) <= 50:
            raise serializers.ValidationError("A cidade deve ter de 2 a 50 caracteres.")
        return value

    def validate_ano_fundacao(self, value):
        if value is not None and not 1850 <= value <= date.today().year:
            raise serializers.ValidationError(f"O ano de fundação deve estar entre 1850 e {date.today().year}.")
        return value

    def validate_descricao(self, value):
        if value is not None and len(value.strip()) > 500:
            raise serializers.ValidationError("A descrição não pode ultrapassar 500 caracteres.")
        return value

    def validate(self, attrs):
        campeonato = _valor(self, attrs, "campeonato")
        mudou = self.instance is None or campeonato != self.instance.campeonato
        if mudou:
            if campeonato.status != Campeonato.Status.INSCRICOES:
                raise serializers.ValidationError({"campeonato": "As inscrições deste campeonato estão encerradas."})
            if campeonato.times.count() >= campeonato.max_times:
                raise serializers.ValidationError({"campeonato": "O campeonato já atingiu o número máximo de times."})
        return attrs


class JogadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jogador
        fields = "__all__"

    def validate_numero_camisa(self, value):
        if not 1 <= value <= 99:
            raise serializers.ValidationError("O número da camisa deve estar entre 1 e 99.")
        return value


class PartidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partida
        fields = "__all__"

    def validate(self, attrs):
        campeonato = _valor(self, attrs, "campeonato")
        mandante = _valor(self, attrs, "mandante")
        visitante = _valor(self, attrs, "visitante")
        data_hora = _valor(self, attrs, "data_hora")
        status = _valor(self, attrs, "status") or Partida.Status.AGENDADA
        gm = _valor(self, attrs, "gols_mandante")
        gv = _valor(self, attrs, "gols_visitante")

        if mandante == visitante:
            raise serializers.ValidationError("Mandante e visitante devem ser times diferentes.")
        if mandante.campeonato_id != campeonato.id or visitante.campeonato_id != campeonato.id:
            raise serializers.ValidationError("Os dois times devem pertencer ao campeonato da partida.")

        conflito = Partida.objects.filter(data_hora=data_hora).filter(
            Q(mandante__in=[mandante, visitante]) | Q(visitante__in=[mandante, visitante])
        )
        if self.instance:
            conflito = conflito.exclude(pk=self.instance.pk)
        if conflito.exists():
            raise serializers.ValidationError({"data_hora": "Um dos times já tem partida neste horário."})

        if status == Partida.Status.FINALIZADA and (gm is None or gv is None):
            raise serializers.ValidationError("Partida finalizada precisa do placar completo.")
        if status == Partida.Status.AGENDADA and (gm is not None or gv is not None):
            raise serializers.ValidationError("Partida agendada não pode ter placar.")
        if self.instance and self.instance.status == Partida.Status.FINALIZADA:
            if (gm, gv) != (self.instance.gols_mandante, self.instance.gols_visitante):
                raise serializers.ValidationError("Partida finalizada não aceita novo placar.")
        return attrs


class PlacarSerializer(serializers.Serializer):
    gols_mandante = serializers.IntegerField(min_value=0)
    gols_visitante = serializers.IntegerField(min_value=0)


class ClassificacaoSerializer(serializers.Serializer):
    posicao = serializers.IntegerField()
    time = serializers.IntegerField(help_text="id do time")
    nome = serializers.CharField()
    jogos = serializers.IntegerField()
    vitorias = serializers.IntegerField()
    empates = serializers.IntegerField()
    derrotas = serializers.IntegerField()
    gols_pro = serializers.IntegerField()
    gols_contra = serializers.IntegerField()
    saldo = serializers.IntegerField()
    pontos = serializers.IntegerField()
