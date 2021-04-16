import useFirebaseAuth from './useFirebaseAuth';
import { renderHook } from '@testing-library/react-hooks';

const mockUser = { getIdToken: () => Promise.resolve('idToken') };

jest.mock('firebase/app', () => {
  const mockAuth = () => ({
    onAuthStateChanged: (fn: Function) => setImmediate(() => fn('mockUser')),
    signInWithPopup: jest.fn(() => Promise.resolve({ user: mockUser })),
    signOut: jest.fn(() => Promise.resolve()),
  });
  mockAuth.GoogleAuthProvider = jest.fn(() => ({ addScope: jest.fn() }));
  return {
    auth: mockAuth,
    initializeApp: jest.fn(),
  };
});

jest.mock('firebase/auth');

// @ts-ignore
window.fetch = jest.fn(() => Promise.resolve({ json: () => ({ token: 'mockVideoToken' }) }));

describe('the useFirebaseAuth hook', () => {
  afterEach(jest.clearAllMocks);

  it('should set isAuthReady to true and set a user on load', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFirebaseAuth());
    expect(result.current.isAuthReady).toBe(false);
    expect(result.current.user).toBe(null);
    await waitForNextUpdate();
    expect(result.current.isAuthReady).toBe(true);
    expect(result.current.user).toBe('mockUser');
  });

  it('should set user to null on signOut', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFirebaseAuth());
    await waitForNextUpdate();
    result.current.signOut();
    await waitForNextUpdate();
    expect(result.current.isAuthReady).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('should set a new user on signIn', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFirebaseAuth());
    await waitForNextUpdate();
    result.current.signIn();
    await waitForNextUpdate();
    expect(result.current.user).toBe(mockUser);
  });
});
