class Xray
{
    constructor(awsXray)
    {
        this.awsXray = awsXray;
    }

    AsyncSubSegment(name, promise, annotations = null, metadata = null)
    {
        return new Promise((resolve, reject) =>
        {
            this.awsXray.captureAsyncFunc(name, (subSegment) =>
            {
                if(subSegment)
                {
                    if(annotations)
                        Object.keys(annotations).map(key => { subSegment.addAnnotation(key, annotations[key]); });
                    if(metadata)
                        Object.keys(metadata).map(key => { subSegment.addMetadata(key, metadata[key]); });
                }

                /* subSegment only defined IF on AWS */
                return promise
                    .then((result) => {
                        if(subSegment)
                            subSegment.close();
                        resolve(result);
                    })
                    .catch((error) => {
                        if(subSegment)
                            subSegment.close(error);
                        reject(error);
                    });
            });
        });
    }


    AsyncSegment(segmentName, subSegmentName, promise, annotations = null, metadata = null)
    {
        return new Promise((resolve, reject) =>
        {
            /* this.awsXray.getSegment() will only be defined on AWS */
            let parentSegment = this.awsXray.getSegment();
            let newSegment = parentSegment ? new this.awsXray.Segment(segmentName, parentSegment.trace_id, parentSegment.id) : undefined;

            this.awsXray.captureAsyncFunc(subSegmentName, (subSegment) =>
            {
                if(subSegment)
                {
                    if(annotations)
                        Object.keys(annotations).map(key => { subSegment.addAnnotation(key, annotations[key]); });
                    if(metadata)
                        Object.keys(metadata).map(key => { subSegment.addMetadata(key, metadata[key]); });

                    newSegment.addSubsegment(subSegment);
                }

                return promise
                    .then((result) =>
                    {
                        if(subSegment)
                        {
                            subSegment.close();
                            newSegment.close();
                        }
                        resolve(result);
                    })
                    .catch((error) =>
                    {
                        if(subSegment)
                        {
                            subSegment.addError(error);
                            subSegment.addErrorFlag();
                            newSegment.addErrorFlag();

                            subSegment.close();
                            newSegment.close();
                        }
                        reject(error);
                    });
            }, newSegment);
        });
    }
}

Xray.SEGMENTS = {

                };

module.exports = Xray;
