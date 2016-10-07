package camp.pixel.challenge.gcreader.ui;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.v7.app.AppCompatActivity;

import com.google.zxing.Result;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Date;

import me.dm7.barcodescanner.zxing.ZXingScannerView;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import timber.log.Timber;

public class MainActivity extends AppCompatActivity implements ZXingScannerView.ResultHandler {

    private static final MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");

    private static final String DIGITAL_OCEAN_ENDPOINT = "http://188.166.155.168:3000/shops/";

    private static final int DELAY_BETWEEN_SCANS = 1000; // 1 second

    private ZXingScannerView mScannerView;
    private Handler mMainHandler;
    private OkHttpClient mOkHttpClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mScannerView = new ZXingScannerView(this);
        mScannerView.setAutoFocus(true);

        setContentView(mScannerView);

        mMainHandler = new Handler(Looper.getMainLooper());
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
        JSONObject jsonShoppingBag = new JSONObject();

        // Simulate some user
        try {
            JSONArray jsonProducts = new JSONArray();
            jsonProducts.put(new JSONObject(result.getText()));

            jsonShoppingBag.put("date", new Date().toString());
            jsonShoppingBag.put("userId", "aristides@pixels.camp");
            jsonShoppingBag.put("items", jsonProducts);
            Timber.v(jsonShoppingBag.toString());
        } catch (JSONException e) {
            Timber.e(e, null);
        }

        Request request = new Request.Builder()
            .url(DIGITAL_OCEAN_ENDPOINT)
            .post(RequestBody.create(MEDIA_TYPE_JSON, jsonShoppingBag.toString()))
            .build();

        mOkHttpClient.newCall(request).enqueue(new Callback() {

            @Override
            public void onFailure(Call call, IOException e) {
                Timber.e(e, null);
            }

            @Override
            public void onResponse(Call call, Response response) {
                try {
                    if (!response.isSuccessful()) {
                        throw new IOException("Unexpected response: " + response);
                    }

                    Timber.v(response.toString());
                } catch (IOException e) {
                    Timber.e(e, null);
                }
            }

        });

        mMainHandler.postDelayed(new Runnable() {

            @Override
            public void run() {
                mScannerView.resumeCameraPreview(MainActivity.this);
            }

        }, DELAY_BETWEEN_SCANS);
    }

    @Override
    public void onPause() {
        super.onPause();

        mScannerView.setResultHandler(null);
        mScannerView.stopCamera();
    }

}
