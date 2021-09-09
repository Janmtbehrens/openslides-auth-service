import { FakeDatastoreAdapter } from './fake-datastore-adapter';
import { FakeRequest } from './fake-request';
import { FakeUserService } from './fake-user-service';
import { TestDatabaseAdapter } from './test-database-adapter';
import { Utils } from './utils';
import { Validation } from './validation';
import { FakeHttpService } from './fake-http-service';

const fakeUserService = FakeUserService.getInstance();
const fakeUser = fakeUserService.getFakeUser();

let database: TestDatabaseAdapter;

beforeAll(async () => {
    database = new TestDatabaseAdapter();
    await database.init();
    await FakeDatastoreAdapter.updateAdmin({ is_active: true });
});

afterEach(async () => {
    fakeUser.reset();
    await database.flushdb();
    await FakeDatastoreAdapter.updateAdmin({ is_active: true });
});

afterAll(() => {
    database.end();
    return;
});

test('POST login with credentials', async () => {
    const result = await FakeRequest.login();
    Validation.validateSuccessfulRequest(result);
    Validation.validateAccessToken(result);
});

test('POST login twice - different session-ids', async () => {
    const sessionOne = Utils.getSessionInformationFromUser(await FakeRequest.login());
    const sessionTwo = Utils.getSessionInformationFromUser(await FakeRequest.login());
    expect(sessionOne.sessionId).not.toBe(sessionTwo.sessionId);
});

test('POST login while inactive', async () => {
    await FakeDatastoreAdapter.updateAdmin({ is_active: false });
    await FakeRequest.sendRequestAndValidateForbiddenRequest(FakeRequest.login());
});

test('GET login', async () => {
    try {
        await FakeHttpService.get('login');
    } catch (e) {
        expect(e.status).toBe(404); // Not found
    }
});

test('POST login without password', async () => {
    await FakeRequest.sendRequestAndValidateForbiddenRequest(
        FakeHttpService.post('login', { data: { username: 'admin' } })
    );
});

test('POST login without username', async () => {
    await FakeRequest.sendRequestAndValidateForbiddenRequest(
        FakeHttpService.post('login', { data: { password: 'admin' } })
    );
});

test('POST login without credentials', async () => {
    await FakeRequest.sendRequestAndValidateForbiddenRequest(FakeHttpService.post('login'));
});

test('POST login with wrong password', async () => {
    await FakeRequest.sendRequestAndValidateForbiddenRequest(
        FakeHttpService.post('login', { data: { username: 'admin', password: 'xyz' } })
    );
});

test('POST login with wrong username', async () => {
    await FakeRequest.sendRequestAndValidateForbiddenRequest(
        FakeHttpService.post('login', { data: { username: 'xyz', password: 'admin' } })
    );
});
