
export default function() {
    return {
        port: process.env.PORT,
        aws: {
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
            AWS_REGION: process.env.AWS_REGION,
            AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
        },
        db: {
            MONGO_URI: process.env.MONGO_URI
        },
        JWT_SECRET: process.env.JWT_SECRET,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
    }
}