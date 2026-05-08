import Script from 'next/script';

export default function RegisterPage() {
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div
          data-fillout-id="11q23nQyqpus"
          data-fillout-embed-type="fullscreen"
          style={{ width: '100%', height: '100%' }}
          data-fillout-inherit-parameters
        />
      </div>
      <Script src="https://server.fillout.com/embed/v1/" strategy="afterInteractive" />
    </>
  );
}
