import HttpStatus from '../../src/constants/status.constant';

type AuthService = typeof import('../../src/services/auth.service').default;
type MockUserRepository = {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
};

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: MockUserRepository;
    let mockBcrypt: {
        hash: jest.Mock;
        compare: jest.Mock;
    };

    const getMockUser = () => ({
        id: 1,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'hashed-password',
    });

    beforeEach(async () => {
        jest.resetModules();

        mockBcrypt = {
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn().mockResolvedValue(true),
        };

        jest.doMock('bcryptjs', () => ({
            __esModule: true,
            default: mockBcrypt,
            hash: mockBcrypt.hash,
            compare: mockBcrypt.compare,
        }));

        jest.doMock('../../src/repositories/user.repository', () => ({
            __esModule: true,
            default: {
                findByEmail: jest.fn(),
                findById: jest.fn(),
                create: jest.fn(),
            },
        }));

        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_EXPIRES_IN = '1h';

        const authModule = await import('../../src/services/auth.service');
        authService = authModule.default;

        userRepository = (
            await import('../../src/repositories/user.repository')
        ).default as unknown as MockUserRepository;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('registers a new user and returns token with sanitized user', async () => {
        const mockUser = getMockUser();
        userRepository.findByEmail.mockResolvedValueOnce(null);
        userRepository.create.mockResolvedValueOnce(mockUser.id);
        userRepository.findById.mockResolvedValueOnce(mockUser);

        const result = await authService.register(
            mockUser.name,
            mockUser.email,
            'StrongP@ss1!'
        );

        expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
        expect(mockBcrypt.hash).toHaveBeenCalledWith('StrongP@ss1!', 12);
        expect(userRepository.create).toHaveBeenCalledWith({
            name: mockUser.name,
            email: mockUser.email,
            password: 'hashed-password',
        });
        expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
        expect(result.user).toEqual({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
        });
        expect(
            (result.user as unknown as Record<string, unknown>).password
        ).toBe(undefined);
        expect(typeof result.token).toBe('string');
    });

    it('throws conflict error when email already exists', async () => {
        const existingUser = getMockUser();
        userRepository.findByEmail.mockResolvedValueOnce(existingUser);

        await expect(
            authService.register(
                existingUser.name,
                existingUser.email,
                'StrongP@ss1!'
            )
        ).rejects.toMatchObject({
            statusCode: HttpStatus.CONFLICT,
            message: 'User already exists',
        });
    });

    it('authenticates a user with correct credentials', async () => {
        const mockUser = getMockUser();
        userRepository.findByEmail.mockResolvedValueOnce(mockUser);

        const result = await authService.login(mockUser.email, 'StrongP@ss1!');

        expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
        expect(mockBcrypt.compare).toHaveBeenCalledWith(
            'StrongP@ss1!',
            mockUser.password
        );
        expect(result.user).toEqual({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
        });
        expect(typeof result.token).toBe('string');
    });

    it('throws unauthorized error when password does not match', async () => {
        const mockUser = getMockUser();
        userRepository.findByEmail.mockResolvedValueOnce(mockUser);
        mockBcrypt.compare.mockResolvedValueOnce(false);

        await expect(
            authService.login(mockUser.email, 'WrongPassword1!')
        ).rejects.toMatchObject({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid email or password',
        });
    });

    it('verifies a valid token and returns payload data', async () => {
        const mockUser = getMockUser();
        userRepository.findByEmail.mockResolvedValueOnce(mockUser);

        const { token } = await authService.login(
            mockUser.email,
            'StrongP@ss1!'
        );

        const payload = authService.verifyToken(token);

        expect(payload.email).toBe(mockUser.email);
        expect(payload.userId).toBe(mockUser.id);
    });
});
