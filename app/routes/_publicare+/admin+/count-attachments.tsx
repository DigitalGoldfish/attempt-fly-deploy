import { countAttachment } from '#app/utils/email-reader.ts'
import { json, type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async () => {
	const directoryPath = process.env.EMAILS_PATH
	const attachmentCounts = await countAttachment(directoryPath)
	return json({
		attachmentCounts,
	})
}
