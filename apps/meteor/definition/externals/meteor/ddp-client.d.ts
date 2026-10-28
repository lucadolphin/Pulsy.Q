declare module 'meteor/ddp-client' {
	interface DDPSubscriptionHandle {
		ready(): boolean;
		stop(): void;
	}

	/** The part of a DDP connection the Exentriq card view uses to talk to a second server. */
	interface DDPConnection {
		callAsync(name: string, ...args: unknown[]): Promise<unknown>;
		subscribe(name: string, ...args: unknown[]): DDPSubscriptionHandle;
		disconnect(): void;
	}

	namespace DDP {
		function connect(url: string, options?: object): DDPConnection;
	}
}
