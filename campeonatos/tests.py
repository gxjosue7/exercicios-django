from datetime import date, datetime, timezone

from rest_framework.test import APITestCase

from .models import Campeonato, Partida, Time

HORA = datetime(2026, 12, 2, 15, tzinfo=timezone.utc)


class RegrasTests(APITestCase):
    def setUp(self):
        self.camp = Campeonato.objects.create(
            nome="Copa", modalidade="Futsal", data_inicio=date(2026, 12, 1), data_fim=date(2026, 12, 20), max_times=2
        )
        self.a = Time.objects.create(nome="A", sigla="A", campeonato=self.camp)
        self.b = Time.objects.create(nome="B", sigla="B", campeonato=self.camp)

    def partida(self, **kw):
        dados = {"campeonato": self.camp.id, "mandante": self.a.id, "visitante": self.b.id, "data_hora": HORA.isoformat()}
        return self.client.post("/api/partidas/", {**dados, **kw}, format="json")

    def test_time_alem_do_limite(self):
        r = self.client.post("/api/times/", {"nome": "C", "sigla": "C", "campeonato": self.camp.id}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_time_com_inscricoes_encerradas(self):
        self.camp.status, self.camp.max_times = "andamento", 5
        self.camp.save()
        r = self.client.post("/api/times/", {"nome": "C", "sigla": "C", "campeonato": self.camp.id}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_partida_mandante_igual_visitante(self):
        self.assertEqual(self.partida(visitante=self.a.id).status_code, 400)

    def test_partida_time_de_outro_campeonato(self):
        outro = Campeonato.objects.create(
            nome="X", modalidade="F", data_inicio=date(2026, 12, 1), data_fim=date(2026, 12, 2), max_times=4
        )
        c = Time.objects.create(nome="C", sigla="C", campeonato=outro)
        self.assertEqual(self.partida(visitante=c.id).status_code, 400)

    def test_conflito_de_horario(self):
        self.assertEqual(self.partida().status_code, 201)
        self.assertEqual(self.partida().status_code, 400)

    def test_placar_so_uma_vez(self):
        pid = self.partida().json()["id"]
        url = f"/api/partidas/{pid}/registrar-placar/"
        r = self.client.post(url, {"gols_mandante": 2, "gols_visitante": 1}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Partida.objects.get(pk=pid).status, "finalizada")
        r = self.client.post(url, {"gols_mandante": 0, "gols_visitante": 0}, format="json")
        self.assertEqual(r.status_code, 409)

    def test_placar_invalido(self):
        pid = self.partida().json()["id"]
        r = self.client.post(f"/api/partidas/{pid}/registrar-placar/", {"gols_mandante": -1, "gols_visitante": 0}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_partida_agendada_nao_aceita_placar(self):
        self.assertEqual(self.partida(gols_mandante=1, gols_visitante=0).status_code, 400)

    def test_docs(self):
        self.assertEqual(self.client.get("/api/docs/").status_code, 200)
        self.assertEqual(self.client.get("/api/schema/").status_code, 200)
