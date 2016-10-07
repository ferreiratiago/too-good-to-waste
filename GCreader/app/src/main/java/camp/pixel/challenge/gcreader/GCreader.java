package camp.pixel.challenge.gcreader;

import android.app.Application;

import timber.log.Timber;

public class GCreader extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        Timber.plant(new Timber.DebugTree());
    }

}
