export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (suject: string, data: string, callback: () => void) => {
          callback()
        }
      ),
  },
}
