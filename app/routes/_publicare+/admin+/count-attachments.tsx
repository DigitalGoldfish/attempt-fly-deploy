import { countAttachmentTypes } from '#app/utils/email-reader.ts'
import { json, type LoaderFunction } from '@remix-run/node'
import path from 'node:path'

export const loader: LoaderFunction = async () => {
	const directoryPath = path.join(process.env.EMAILS_PATH, 'used')
	const attachmentCounts = await countAttachmentTypes(directoryPath)
	return json({
		msg: 'Done',
		attachmentCounts,
	})
}
