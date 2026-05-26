import unittest
from datetime import date, timedelta

from app.schemas.forecast import KebutuhanStokData
from app.services.arima_service import ARIMAService


class ARIMAServiceTest(unittest.TestCase):
    def make_demand_data(self, count: int = 20) -> list[KebutuhanStokData]:
        start_date = date(2026, 1, 4)

        return [
            KebutuhanStokData(
                tanggal=start_date + timedelta(days=7 * index),
                jumlah_terjual=100 + index,
            )
            for index in range(count)
        ]

    def test_prepare_data_uses_jumlah_terjual(self):
        service = ARIMAService()
        series = service.prepare_data(self.make_demand_data(3))

        self.assertEqual(list(series), [100.0, 101.0, 102.0])
        self.assertEqual(series.index[0].date(), date(2026, 1, 4))

    def test_fit_uses_chronological_train_test_split(self):
        service = ARIMAService()
        metrics = service.fit(self.make_demand_data(20))

        self.assertEqual(metrics["evaluation_method"], "chronological_train_test_split_80_20")
        self.assertEqual(metrics["train_size"], 16)
        self.assertEqual(metrics["test_size"], 4)
        self.assertEqual(len(metrics["evaluation_samples"]), 4)
        self.assertIn("mape", metrics)
        self.assertIn("rmse", metrics)
        self.assertIn("mae", metrics)

    def test_forecast_returns_requested_future_weeks(self):
        service = ARIMAService()
        service.fit(self.make_demand_data(20))

        predictions = service.forecast(3)

        self.assertEqual(len(predictions), 3)
        self.assertEqual(predictions[0].week, "Minggu 1")
        self.assertGreaterEqual(predictions[0].value, 0)


if __name__ == "__main__":
    unittest.main()
