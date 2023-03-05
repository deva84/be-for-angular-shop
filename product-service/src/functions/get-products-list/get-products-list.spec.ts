import {dataService, DataService} from "../../data-service/data.service";
import {getProductsList} from "./get-products-list";

const mockData = [
    {id: "id_1", title: "Product 1"},
    {id: "id_2", title: "Product 2"},
    {id: "id_3", title: "Product 3"},
    {id: "id_4", title: "Product 4"},
];

const error = new Error("Error!");

const mockService: DataService = {
    getAllProducts: jest.fn(() => Promise.resolve(mockData)),
} as any as DataService;

const dataServiceError: DataService = {
    getAllProducts: jest.fn(() => Promise.reject(error)),
} as any as DataService;

jest.mock("../../libs/api-gateway", () => ({
    formatJSONResponse: jest.fn((_obj, response) => {
        return response;
    }),
}));

describe('#getAllProducts', () => {

    test('should return correct products list', async () => {
        jest.spyOn(dataService, 'getAllProducts').mockReturnValue(mockService.getAllProducts())
        const response = await getProductsList();
        expect(response).toEqual(mockData);
    });


    test("#getAllProducts should return error", async () => {
        jest.spyOn(dataService, 'getAllProducts').mockReturnValue(dataServiceError.getAllProducts())
        const response = await getProductsList();
        expect(response).toEqual(error.message);
    });
});
