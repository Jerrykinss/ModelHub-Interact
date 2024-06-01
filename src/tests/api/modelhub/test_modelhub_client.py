import unittest
from src.pages.api.modelhub.modelhub_client import list_models, run_modelhub_model, stop_modelhub_model, predict, get_init_value, get_container_id, get_docker_port
from app import create_app

# python -m unittest discover -s ./tests/modelhub_integration

class ModelHubClientTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create and configure an instance of the Flask application
        cls.app = create_app()

    def setUp(self):
        # Create a test client
        self.client = self.app.test_client()

    def test_list_models(self):
        # Call the list_models function and assert the expected output
        models = list_models()
        print(models)
        self.assertIsInstance(models, dict)

    # def test_run_modelhub_model(self):
    #     with self.app.app_context():
    #         # Call the run_modelhub_model function with a model name
    #         process = run_modelhub_model("squeezenet")
    #         print(process)
    #         self.assertIsNotNone(process)
    #     self.single_predict()
    #     self.stop_modelhub_model(process, "squeezenet")
    
    # def stop_modelhub_model(self, process, model_name):
    #     with self.app.app_context():
    #         # Call the stop_modelhub_model function with a model name
    #         output = stop_modelhub_model(process, model_name)
    #         print(output["stdout"])
    #         self.assertIsNotNone(output)
    
    # def get_docker_port(self):
    #     with self.app.app_context():
    #         # Call the get_docker_port function with a Docker container ID
    #         value = get_init_value("squeezenet", "docker_id")
    #         print(value)
    #         container_id = get_container_id(value)
    #         print(container_id)
    #         port = get_docker_port(container_id)
    #         print(port)
    #         self.assertIsNotNone(port)

    # def single_predict(self):
    #     # Call the predict function with file input data and assert the expected output
    #     with open("C:/Users/jerry/modelhub-interact/backend/modelhub/models/squeezenet/contrib_src/sample_data/airplane.jpg", "rb") as input_data:
    #         # content_type = 'image/jpeg'
    #         prediction = predict(self.get_docker_port(), input_data)
    #         print("Single input prediction:", prediction)
    #         self.assertIsInstance(prediction, dict)
    #         self.assertIn("prediction", prediction)
    #         self.assertEqual(prediction["prediction"], "Prediction result")

    def test_single_predict(self):
        with self.app.app_context():
            process = run_modelhub_model("squeezenet")
            try:
                container_id = get_container_id(get_init_value("squeezenet", "docker_id"))
                print(container_id)
                self.assertIsNotNone(process)
                self.assertIsNotNone(container_id)
                filepath = "https://assets-prd.punchdrink.com/wp-content/uploads/2014/11/10171021/Article-High-ALtitude-HIghball-Genepy-Cocktail-Recipe.jpg"
                prediction = predict(get_docker_port(container_id), filepath)
                print("Single input prediction:", prediction)
                predictions = prediction['output'][0]['prediction']
                sorted_predictions = sorted(predictions, key=lambda x: x['probability'], reverse=True)
                top_predictions = sorted_predictions[:5]
                for i in top_predictions:
                    print(i)
                self.assertIsInstance(prediction, dict)
            finally:
                stop_modelhub_model(process, container_id)

    # def test_predict_with_json_input(self):
    #     # Call the predict function with JSON input data and assert the expected output
    #     input_data = '{"input1": "data1", "input2": "data2"}'
    #     content_type = 'application/json'
    #     response = predict(input_data, content_type)
    #     self.assertIsInstance(response, dict)
    #     self.assertIn("prediction", response)
    #     self.assertEqual(response["prediction"], "Prediction result")

if __name__ == '__main__':
    unittest.main()