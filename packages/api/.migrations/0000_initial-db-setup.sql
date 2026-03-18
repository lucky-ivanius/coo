CREATE TABLE `assertions` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`claim` text NOT NULL,
	`bond_sats` integer NOT NULL,
	`liveness` integer NOT NULL,
	`asserter` text NOT NULL,
	`disputer` text,
	`settler` text,
	`resolver` text,
	`status` text DEFAULT 'open' NOT NULL,
	`asserted_tx_id` text NOT NULL,
	`asserted_at_block` integer NOT NULL,
	`disputed_tx_id` text,
	`disputed_at_block` integer,
	`settled_tx_id` text,
	`settled_at_block` integer,
	`resolved_tx_id` text,
	`resolved_at_block` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transaction_events` (
	`id` text PRIMARY KEY NOT NULL,
	`tx_id` text NOT NULL,
	`contract_address` text NOT NULL,
	`event_index` integer NOT NULL,
	`event_type` text NOT NULL,
	`event_data` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transaction_event_unique` ON `transaction_events` (`tx_id`,`event_index`);