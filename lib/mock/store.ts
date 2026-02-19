import mockData from "@/data/mock/mock-api.json";

export type MockData = typeof mockData;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

type Dict = Record<string, unknown>;

const state = {
    negotiationIndex: clone(mockData.state.negotiationIndex) as Array<Dict>,
    negotiationProposals: clone(mockData.state.negotiationProposals) as Record<string, Dict>,
    negotiationCart: clone(mockData.state.negotiationCart) as Array<Dict>,
    negotiationOrders: clone(mockData.state.negotiationOrders) as Array<Dict>,
    inventoryCart: clone(mockData.inventory.cart) as Array<Dict>,
};

export const mockStore = {
    data: mockData,
    state,
    clone,
};
