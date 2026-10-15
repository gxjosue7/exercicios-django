from django.db import models


class Campeonato(models.Model):
    class Status(models.TextChoices):
        INSCRICOES = "inscricoes", "Inscrições Abertas"
        ANDAMENTO = "andamento", "Em Andamento"
        ENCERRADO = "encerrado", "Encerrado"

    nome = models.CharField(max_length=100)
    modalidade = models.CharField(max_length=50)
    data_inicio = models.DateField()
    data_fim = models.DateField()
    max_times = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.INSCRICOES,
    )

    def __str__(self):
        return self.nome


class Time(models.Model):
    nome = models.CharField(max_length=100)
    sigla = models.CharField(max_length=5)
    campeonato = models.ForeignKey(
        Campeonato,
        on_delete=models.CASCADE,
        related_name="times" 
    )

    class Meta:
        constraints = [  # noqa: RUF012
            models.UniqueConstraint(
                fields=["campeonato", "nome"],
                name="time_unico_no_campeonato"
            )
        ]

    def __str__(self):
        return f"{self.nome}"

class Jogador(models.Model):
    nome = models.CharField(max_length=100)
    numero_camisa = models.PositiveSmallIntegerField()
    posicao = models.CharField(max_length=30, blank=True)
    time = models.ForeignKey(Time, on_delete=models.CASCADE, related_name="jogadores")

    class Meta:
        constraints = [  # noqa: RUF012
            models.UniqueConstraint(fields=["time", "numero_camisa"], name="camisa_unica_no_time"),
        ]

    def __str__(self):
        return self.nome


class Partida(models.Model):
    class Status(models.TextChoices):
        AGENDADA = "agendada", "Agendada"
        FINALIZADA = "finalizada", "Finalizada"

    campeonato = models.ForeignKey(Campeonato, on_delete=models.CASCADE, related_name="partidas")
    mandante = models.ForeignKey(Time, on_delete=models.CASCADE, related_name="partidas_como_mandante")
    visitante = models.ForeignKey(Time, on_delete=models.CASCADE, related_name="partidas_como_visitante")
    data_hora = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AGENDADA)
    gols_mandante = models.PositiveIntegerField(null=True, blank=True)
    gols_visitante = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.mandante} x {self.visitante}"
