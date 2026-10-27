import { createReadStream } from 'node:fs';
import fsp from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';

import type { IUpload } from '@rocket.chat/core-typings';

import { FileUpload } from './FileUpload';
import { getFileRange, setRangeHeaders } from './ranges';
import { db } from '../../../../database/utils';
import { settings } from '../../../../settings';
import { getContentDisposition } from '../config/helper';

type LegacyTalkAttachment = {
	_id: string;
	name: string;
	path?: string;
	type?: string;
	size?: number;
	userId?: string;
	meta?: { rid?: string; uploadedAt?: Date };
	createdAt?: Date;
};

const findLegacyAttachment = (id: string) => db.collection<LegacyTalkAttachment>('talk_attachments').findOne({ _id: id });

/**
 * Streams an attachment uploaded through the legacy Talk app (`talk_attachments`),
 * stored under the basename of the record's `path` in the configured FileSystem upload folder.
 * Returns false when `id` is not a legacy attachment, so the caller can answer 404.
 */
export const respondWithLegacyTalkAttachment = async (id: string, req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
	const attachment = await findLegacyAttachment(id);
	if (!attachment) {
		return false;
	}

	const file = {
		_id: attachment._id,
		name: attachment.name,
		type: attachment.type,
		size: attachment.size,
		userId: attachment.userId,
		rid: attachment.meta?.rid,
		uploadedAt: attachment.meta?.uploadedAt ?? attachment.createdAt,
	} as IUpload;

	if (!(await FileUpload.requestCanAccessFiles(req, file))) {
		res.writeHead(403);
		res.end();
		return true;
	}

	const folder = settings.get<string>('FileUpload_FileSystemPath');
	const filePath = path.join(folder, path.basename(attachment.path ?? attachment._id));

	try {
		const stat = await fsp.stat(filePath);
		if (!stat.isFile()) {
			res.writeHead(404);
			res.end();
			return true;
		}

		const size = stat.size;
		const options: { start?: number; end?: number } = {};

		res.setHeader('Content-Security-Policy', "default-src 'none'");
		res.setHeader('Cache-Control', 'max-age=31536000');
		res.setHeader('Content-Disposition', `${getContentDisposition(req)}; filename*=UTF-8''${encodeURIComponent(file.name || '')}`);
		file.uploadedAt && res.setHeader('Last-Modified', file.uploadedAt.toUTCString());
		res.setHeader('Content-Type', file.type || 'application/octet-stream');
		res.setHeader('Accept-Ranges', 'bytes');

		if (req.headers.range) {
			const range = getFileRange({ ...file, size }, req);
			if (range) {
				setRangeHeaders(range, { ...file, size }, res);
				if (range.outOfRange) {
					return true;
				}
				options.start = range.start;
				options.end = range.stop;
			}
		}

		if (!res.getHeader('Content-Length')) {
			res.setHeader('Content-Length', size);
		}

		createReadStream(filePath, options).pipe(res);
	} catch (e) {
		res.writeHead(404);
		res.end();
	}
	return true;
};
