import {dataService, DataService} from "../../data-service/data.service";
import {APIGatewayProxyEvent} from "aws-lambda";
import {getProductsById} from "./get-products-by-id";

const mockData = [
    {id: "id_1", title: "Product 1"},
    {id: "id_2", title: "Product 2"},
    {id: "id_3", title: "Product 3"},
    {id: "id_4", title: "Product 4"},
];

const mockService: DataService = {
    getProductById: jest.fn(() => Promise.resolve(mockData[1])),
} as any as DataService;

const dataServiceError: DataService = {
    getProductById: jest.fn(() => Promise.resolve(undefined)),
} as any as DataService;

jest.mock("../../libs/api-gateway", () => ({
    formatJSONResponse: jest.fn((_obj, response) => {
        return response;
    }),
}));


describe('#getProductById', () => {

    test('should return correct product by ID', async () => {
        const id = "id_2";
        const mockEvent: APIGatewayProxyEvent = {
            pathParameters: {
                productId: id,
            },
        } as any as APIGatewayProxyEvent;

        jest.spyOn(dataService, 'getProductById').mockReturnValue(mockService.getProductById(id))
        const response = await getProductsById(mockEvent);
        expect(response).toEqual(mockData[1]);
    });


    test("should return error when product is not found", async () => {
        const id = "id_7";
        const mockEvent: APIGatewayProxyEvent = {
            pathParameters: {
                productId: id,
            },
        } as any as APIGatewayProxyEvent;
        const expectedResponse = "Product ID: 'id_7' was not found!";

        jest.spyOn(dataService, 'getProductById').mockReturnValue(dataServiceError.getProductById(id))
        const response = await getProductsById(mockEvent);
        expect(response).toEqual(expectedResponse);
    });
});
