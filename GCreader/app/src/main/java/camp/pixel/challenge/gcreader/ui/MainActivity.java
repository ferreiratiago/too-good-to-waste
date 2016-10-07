package camp.pixel.challenge.gcreader.ui;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.google.zxing.Result;

import java.io.IOException;

import me.dm7.barcodescanner.zxing.ZXingScannerView;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import timber.log.Timber;

public class MainActivity extends AppCompatActivity implements ZXingScannerView.ResultHandler {

    private static final MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");

    private static final String DIGITAL_OCEAN_ENDPOINT = "http://188.166.155.168";

    private ZXingScannerView mScannerView;
    private OkHttpClient mOkHttpClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mScannerView = new ZXingScannerView(this);
        mScannerView.setAutoFocus(true);

        setContentView(mScannerView);

        mOkHttpClient = new OkHttpClient();
    }

    @Override
    public void onResume() {
        super.onResume();

        mScannerView.setResultHandler(this);
        mScannerView.startCamera();
    }

    @Override
    public void handleResult(Result result) {
        Request request = new Request.Builder()
            .url(DIGITAL_OCEAN_ENDPOINT)
            .post(RequestBody.create(MEDIA_TYPE_JSON, result.getText()))
            .build();

        try {
            Response response = mOkHttpClient.newCall(request).execute();

            if (!response.isSuccessful()) {
                throw new IOException(String.format("Unexpected code: %s", response));
            }
        } catch (IOException e) {
            Timber.e(e, null);
        } finally {
            finish();
        }
    }

    @Override
    public void onPause() {
        super.onPause();

        mScannerView.setResultHandler(null);
        mScannerView.stopCamera();
    }

}
