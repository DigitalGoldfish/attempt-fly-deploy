import { json, type LoaderFunction } from '@remix-run/node'
import { countAttachment } from '#app/utils/email-reader.ts'

export const loader: LoaderFunction = async () => {
	const directoryPath = process.env.DEMODATA_FOLDER
	const attachmentCounts = await countAttachment(directoryPath)
	return json({
		attachmentCounts,
	})
}
