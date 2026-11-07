from decimal import Decimal

from rest_framework import serializers

from .models import Produto


class ProdutoSerializer(serializers.ModelSerializer):
    marca = serializers.CharField(required=True, max_length=50)
    estoque = serializers.IntegerField(required=True)

    class Meta:
        model = Produto
        fields = ("id", "nome", "preco", "marca", "estoque", "descricao")

    def validate_nome(self, value):
        nome_limpo = value.strip()
        if len(nome_limpo) < 2:
            raise serializers.ValidationError(
                "O nome deve possuir pelo menos 2 caracteres."
            )
        return nome_limpo

    def validate_preco(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("O preço deve ser maior que zero.")
        return value

    def validate_marca(self, value):
        marca_limpa = value.strip()
        if len(marca_limpa) < 2:
            raise serializers.ValidationError(
                "A marca deve possuir entre 2 e 50 caracteres."
            )
        return marca_limpa

    def validate_estoque(self, value):
        if value < 0:
            raise serializers.ValidationError("O estoque não pode ser negativo.")
        return value

    def validate_descricao(self, value):
        if value is not None and len(value.strip()) > 500:
            raise serializers.ValidationError(
                "A descrição não pode ultrapassar 500 caracteres."
            )
        return value
