from django.db import models


class Produto(models.Model):
    nome = models.CharField(max_length=100)
    preco = models.DecimalField(max_digits=8, decimal_places=2)
    marca = models.CharField(max_length=50, default="Genérica")
    estoque = models.IntegerField(default=0)
    descricao = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nome} - R$ {self.preco}"
